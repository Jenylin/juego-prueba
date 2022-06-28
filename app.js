document.write('Hola mundo');

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

(function () {

    let playerId;
    let playerRef;

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
            // Dentro del siguiente método se puede pasar un objeto o un valor, o un string.
            // En este caso, creamos un objeto
            playerRef.set({
                id: playerId,
                name: "BENITO",
                color: "blue",
                x: 3,
                y: 3,
                coins: 0,
            })
            
            // La siguiente línea es para remover al usuario de Firebase cuando abandona la página
            playerRef.onDisconnect().remove();

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
