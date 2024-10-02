<?php
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
    $nombre_completo = $_POST['nombre_completo'];
    $nick = $_POST['nick'];
    $correo = $_POST['correo'];
    $contraseña = password_hash($_POST['contraseña'], PASSWORD_BCRYPT);

    // Validar que no se repita el correo ni el nick
    $sql = "SELECT * FROM users WHERE correo='$correo' OR nick='$nick'";
    $result = $conn->query($sql);

    if ($result->num_rows > 0) {
        // Verificar si el correo ya está registrado
        $row = $result->fetch_assoc();
        if ($row['correo'] == $correo) {
            header('Location: registro.php?error=correo');
            exit();
        }
        // Verificar si el nick ya está registrado
        if ($row['nick'] == $nick) {
            header('Location: registro.php?error=nick');
            exit();
        }
    } else {
        // Insertar el nuevo usuario
        $sql = "INSERT INTO users (nombre_completo, nick, correo, contraseña) VALUES ('$nombre_completo', '$nick', '$correo', '$contraseña')";

        if ($conn->query($sql) === TRUE) {
            // Registro exitoso, redirigir con éxito
            header('Location: ./login.html');
            exit();
        } else {
            echo "Error: " . $sql . "<br>" . $conn->error;
        }
    }
}

$conn->close();
?>
