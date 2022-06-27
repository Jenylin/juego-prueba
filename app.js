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

    // Cuando la app arranque, vamos a escuchar los cambios de auth y vamos a disparar/generar un 
    //cambio en auth ingresando de manera anónima y entonces eso debe disparar la parte del if.
    firebase.auth().onAuthStateChanged((user) => {
        console.log(user)
        if (user) {
            //You're logged in!
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
