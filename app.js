const playerColors = [
    "CUCHO", "PANZA", "DON-GATO", "DEMOSTENES", "ESPANTO", "BENITO", "GARFIELD", "SILVESTRE", "TOM", "HOBBES", "MICIFUZ", "HELLO-KITTY",
    "MARIE", "TOULOUSE", "BERLIOZ", "O-MALLEY", "DUCHESS", "LUCIFER", "FELIX"
];

//Misc Helpers

//Recibe cualquier arreglo y regresa un elemento aleatorio de ese arreglo
function randomFromArray(array) {
    return array[Math.floor(Math.random() * array.length)];
}

// "x" y "y" son coordenadas de la cuadrícula
// esta función recibe dos coordenadas y las regresa juntas como un string
function getKeyString(x, y) {
    return `${x}x${y}`;
}

function getRandomSafeSpot() {
    return randomFromArray([
        { x: 1, y: 4 },
        { x: 2, y: 4 },
        { x: 1, y: 5 },
        { x: 2, y: 6 },
        { x: 2, y: 8 },
        { x: 2, y: 9 },
        { x: 4, y: 8 },
        { x: 5, y: 5 },
        { x: 5, y: 8 },
        { x: 5, y: 10 },
        { x: 5, y: 11 },
        { x: 11, y: 7 },
        { x: 12, y: 7 },
        { x: 13, y: 7 },
        { x: 13, y: 6 },
        { x: 13, y: 8 },
        { x: 7, y: 6 },
        { x: 7, y: 7 },
        { x: 7, y: 8 },
        { x: 8, y: 8 },
        { x: 10, y: 8 },
        { x: 11, y: 4 },
    ]);
}

function placeJSCoin() {
    const { x, y } = getRandomSafeSpot();
    const coinJSRef = firebase.database().ref(`jsCoins/${getKeyString(x, y)}`);
    coinJSRef.set({
        x,
        y,
    })

    const coinJSTimeouts = [2000, 3000, 4000, 5000];
    setTimeout(() => {
        placeJSCoin();
    }, randomFromArray(coinJSTimeouts))
}

(function () {

    let playerId;
    let playerRef;
    let players = {};
    // Necesitamos mantener una referencia a estos elementos para poder actualizarlos después en el callback allPlayersRef.on("value", (snapshot) => {})
    // cuando algo cambie, por ejemplo: cuando un personaje diferente se mueva a través del mapa, necesitaremos actualizar ese div para ese personaje.
    // Así que crearemos el objeto playerElements.
    let playerElements = {};

    let jsCoins = {};
    let coinJSElements = {};
    let javaCoins = {};
    let coinJavaElements = {};
    let htmlCoins = {};
    let coinHtmlElements = {};

    // La siguiente es una referencia a nuestro elemento del DOM:
    const gameContainer = document.querySelector(".contenedor-del-juego");

    function handleArrowPress(xChange = 0, yChange = 0) {
        const newX = players[playerId].x + xChange;
        const newY = players[playerId].y + yChange;
        players[playerId].x = newX;
        players[playerId].y = newY;
        if (xChange === 1) {
            players[playerId].direction = "right";
        }
        if (xChange === -1) {
            players[playerId].direction = "left";
        }
        playerRef.set(players[playerId]);
    }

    function initGame() {

        new KeyPressListener("ArrowUp", () => handleArrowPress(0, -1))
        new KeyPressListener("ArrowDown", () => handleArrowPress(0, 1))
        new KeyPressListener("ArrowLeft", () => handleArrowPress(-1, 0))
        new KeyPressListener("ArrowRight", () => handleArrowPress(1, 0))

        // La siguiente es una referencia a todos los jugadores del juego, en oposición a playerRef, ya que esta última es una referencia sólo nuestra
        // a la que tenemos acceso para actualizar y escribir. Esta referencia de aquí abajo nos permite ver a otros jugadores en el juego.
        const allPlayersRef = firebase.database().ref(`players`);
        // La referencia de abajo nos permite leer todas las monedas que están en el mundo del juego.
        const allCoins = firebase.database().ref(`coins`);

        // El método de abajo es un "listener" que establece un callback para ejecutarse cuando el valor de este ref cambia.
        // En otras palabras, cada que un jugador se une o se va, o cada vez que sufre una modificación, este callback se ejecutará.
        // Esta palabra clave "value" viene de firebase.
        allPlayersRef.on("value", (snapshot) => {
            players = snapshot.val() || {}; // Sincronizamos el valor de "players" a lo que sea que esté en firebase. 
            Object.keys(players).forEach((key) => {
                const characterState = players[key]; // characterState es un objeto que tiene nuestro nombre, dirección, etc.
                let el = playerElements[key]; // Veremos nuestra referencia al elemento del dom en pantalla.
                el.querySelector(".Character_name").innerText = characterState.name;
                el.querySelector(".Character_coins").innerText = characterState.coins;
                el.setAttribute("data-color", characterState.color);
                el.setAttribute("data-direction", characterState.direction);
                const left = 16 * characterState.x + "px";
                const top = 16 * characterState.y - 4 + "px";
                el.style.transform = `translate3d(${left}, ${top}, 0)`
            })
        })

        // Se ejecuta cuando un nuevo nodo se agrega al árbol, es decir, cuando un nuevo jugador (nuevo para mí) se une.
        allPlayersRef.on("child_added", (snapshot) => {
            // La constante de aquí abajo nos da el objeto que se ve exactamente como el de abajo ({ id: playerId,name, color: randomFromArray(playerColors),
            //  x: 3,  y: 3, coins: 0, })
            const addedPlayer = snapshot.val(); // val es un método de los snapshots que viene de las refs de firebase
            // En la línea de aquí abajo creamos un div
            const characterElement = document.createElement("div");
            // En la siguiente línea añadimos algunas clases al div.
            characterElement.classList.add("Character", "grid-cell");
            if (addedPlayer.id === playerId) {
                // La siguiente línea permite que tu capa esté sobre las de todos los demás y muestra también una pequeña flecha verde
                // que indica quién eres en la pantalla.
                characterElement.classList.add("you");
            }

            // El innerHTML de nuestro div tendŕa una sombra
            // también tendrá el sprite de nuesro personaje
            // El Character_name_container muestra el texto sobre las cabezas de nuestros personajes. Dentro de este habrá un
            // espacio donde irá el nombre y también un espacio dorado de texto que contará el número de monedas. Este último lo
            // iniciaremos como cero.
            // Finalmente, tendremos un div llamado Character_you_arrow que tendrá un pequeño indicador de qué personaje eres en la pantalla.
            characterElement.innerHTML = (`
                <div class = "Character_shadow grid-cell"></div>
                <div class = "Character_sprite grid-cell"></div>
                <div class = "Character_name-container">
                    <span class = "Character_name"></span>
                    <span class = "Character_coins">0</span>
                </div>
                <div class = "Character_you-arrow"></div>
            `);

            // Aquí poblaremos el objeto playerElements.
            playerElements[addedPlayer.id] = characterElement;

            // Llenaremos un estado inicial. (Cuál es el nombre, el contador de monedas.)
            // Estamos usando un querySelector para seleccionar del div de arriba el nombre y las monedas.
            characterElement.querySelector(".Character_name").innerText = addedPlayer.name;
            characterElement.querySelector(".Character_coins").innerText = addedPlayer.coins;
            // Las siguientes dos líneas son para dar estilo:
            characterElement.setAttribute("data-color", addedPlayer.color);
            characterElement.setAttribute("data-direction", addedPlayer.direction);
            // Las siguientes tres líneas son para posicionar a nuestro personaje:
            const left = 16 * addedPlayer.x + "px"; // El tamaño de la cuadrícula por la posición donde está el personaje.
            const top = 16 * addedPlayer.y - 4 + "px";
            characterElement.style.transform = `translate3d(${left},${top},0)`;
            gameContainer.appendChild(characterElement);


        })

        allPlayersRef.on("child_removed", (snapshot) => { // Esto nos servirá para quitar a los personajes del DOM una vez que el usuario
            // cierre la ventana de su navegador.
            const removedKey = snapshot.val().id;
            gameContainer.removeChild(playerElements[removedKey]);
            delete playerElements[removedKey];


        })


        allJSCoinsRef.on("child_added", (snapshot) => {
            const coinJS = snapshot.val();
            const key = getKeyString(coinJS.x, coinJS.y);
            jsCoins[key] = true;


            // Create the DOM Element
            const coinJSElement = document.createElement("div");
            coinJSElement.classList.add("CoinJS", "grid-cell");
            coinJSElement.innerHTML = `
        <div class="Coin_shadow grid-cell"></div>
        <div class="CoinJS_sprite grid-cell"></div>
      `;

            // Position the Element
            const left = 16 * coinJS.x + "px";
            const top = 16 * coinJS.y - 4 + "px";
            coinJSElement.style.transform = `translate3d(${left}, ${top}, 0)`;

            // Keep a reference for removal later and add to DOM
            coinJSElements[key] = coinJSElement;
            gameContainer.appendChild(coinJSElement);

        })

        allJSCoinsRef.on("child_removed", (snapshot) => {
            const {x,y} = snapshot.val();
            const keyToRemove = getKeyString(x,y);
            gameContainer.removeChild( coinJSElements[keyToRemove] );
            delete coinJSElements[keyToRemove];
          })

        // Colocar la primera moneda JS
        placeJSCoin();

    }

    // Cuando la app arranque, vamos a escuchar los cambios de auth y vamos a disparar/generar un 
    //cambio en auth ingresando de manera anónima y entonces eso debe disparar la parte del if.
    firebase.auth().onAuthStateChanged((user) => {
        console.log(user)
        if (user) {
            //You're logged in!
            playerId = user.uid; // Esto es lo que aparece en la consola como "uid"
            // Un ref es cómo interactuas con un nodo de firebase
            // En nuestro caso, nuestro jugador en el que estamos "logueados" va a ser su propio nodo en el árbol
            // Vamos a tener una referencia a ese nodo y entonces podemos actualizarlo, por ejemplo: cambiar nuestro
            // nombre, posición, color del personaje, apariencia y también podremos borrarnos a nosotros mismos
            // del árbol cuando cerremos el explorador y salgamos del juego
            // Todo esto sucede al interactuar con un "ref"
            // Esta línea crea el padre de los jugadores por nosotros y luego creará un nodo para nuestro player id.
            playerRef = firebase.database().ref(`players/${playerId}`);



            // La siguiente función permite asignar un nombre aleatorio a cada usuario que se conecta.
            function createName() {
                const gato = randomFromArray([
                    "BENITO",
                    "PANZA",
                    "DEMOSTENES",
                    "CUCHO",
                    "ESPANTO",
                    "DON-GATO",
                    "GARFIELD",
                    "SILVESTRE",
                    "TOM",
                    "HOBBES",
                    "MICIFUZ",
                    "HELLO-KITTY",
                    "O-MALLEY",
                    "MARIE",
                    "BERLIOZ",
                    "DUCHESS",
                    "TOULOUSE",
                    "LUCIFER",
                    "FELIX"
                ]);
                return `${gato}`;
            }

            const name = createName();
            const { x, y } = getRandomSafeSpot();

            // Dentro del siguiente método se puede pasar un objeto o un valor, o un string.
            // En este caso, creamos un objeto
            playerRef.set({
                id: playerId,
                name,
                direction: "right",
                color: name,
                x,
                y,
                coins: 0,
            })

            // La siguiente línea es para remover al usuario de Firebase cuando abandona la página
            playerRef.onDisconnect().remove();

            // Comenzar la funcionalidad del juego, localmente, para nosotros, ahora que estamos "logueados".
            initGame();

        } else {
            //You're logged out
        }
    })

    // El juego se "loguea" o "inicia sesión" o "ingresa" a firebase usando este método
    // Si algo va mal, aparecerá un error
    firebase.auth().signInAnonymously().catch((error) => {
        // El nos muestra informacion como un código
        var errorCode = error.code;
        // y también muestra un mensaje al ususario
        var errorMessage = error.message;
        // ...
        console.log(errorCode, errorMessage);
    });

})();
