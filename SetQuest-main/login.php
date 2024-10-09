<?php
session_start();

// Conexión a la base de datos
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "setquest";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Conexión fallida: " . $conn->connect_error);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $correo = $_POST['correo'];
    $contraseña = $_POST['contraseña'];
    // Usar prepared statements para evitar inyecciones SQL
    $sql = $conn->prepare("SELECT * FROM usuario WHERE correo = ?");
    $sql->bind_param('s', $correo);
    $sql->execute();
    $result = $sql->get_result();

    if ($result->num_rows > 0) {
        $user = $result->fetch_assoc();
        if (password_verify($contraseña, $user['contraseña'])) {  // Cambié $usuario a $user
            $_SESSION['usuario'] = $user['nombre_completo'];
            header('Location: ./seleccion-modos.html');
            exit();  // Detener el script tras la redirección
        } else {
            echo "Contraseña incorrecta.";
        }
    } else {
        echo "Correo no registrado.";
    }
}
$conn->close();
?>