<?php
session_start();

// Conexión a la base de datos
$servername = "localhost";
$username = "root";  // Cambia esto si tienes otro usuario
$password = "";  // Cambia esto si tienes contraseña
$dbname = "usuarios";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Conexión fallida: " . $conn->connect_error);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $correo = $_POST['correo'];
    $contraseña = $_POST['contraseña'];

    // Verificar si el correo existe
    $sql = "SELECT * FROM users WHERE correo='$correo'";
    $result = $conn->query($sql);

    if ($result->num_rows > 0) {
        $user = $result->fetch_assoc();
        if (password_verify($contraseña, $user['contraseña'])) {
            $_SESSION['usuario'] = $user['nombre_completo'];
            echo "Inicio de sesión exitoso.";
            header('Location: ./seleccion-modos.html');  // Redirigir a la página principal
        } else {
            echo "Contraseña incorrecta.";
        }
    } else {
        echo "Correo no registrado.";
    }
}

$conn->close();
?>
