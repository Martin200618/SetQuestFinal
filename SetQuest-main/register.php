<?php
// Conexión a la base de datos
$servername = "localhost";
$username = "root";  // Cambia esto si tienes otro usuario
$password = "";  // Cambia esto si tienes contraseña
$dbname = "setquest";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Conexión fallida: " . $conn->connect_error);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Asegúrate de obtener el nombre del usuario del formulario correctamente
    $nombre_usuario = $_POST['nombre_usuario'] ?? ''; // Cambia a 'nombre_usuario'
    $correo = $_POST['correo'] ?? ''; // Asegúrate de que esto esté presente
    $contrasena = password_hash($_POST['contrasena'], PASSWORD_BCRYPT);

    // Validar que no se repita el correo ni el nick
    $sql = "SELECT * FROM usuario WHERE correo='$correo' OR nombre_usuario='$nombre_usuario'";
    $result = $conn->query($sql);

    if ($result->num_rows > 0) {
        // Verificar si el correo ya está registrado
        $row = $result->fetch_assoc();
        if ($row['correo'] == $correo) {
            header('Location: registro.php?error=correo');
            exit();
        }
        // Verificar si el nombre ya está registrado
        if ($row['nombre_usuario'] == $nombre_usuario) {
            header('Location: registro.php?error=nombre_usuario');
            exit();
        }
    } else {
        // Insertar el nuevo usuario
        $sql = "INSERT INTO usuario (nombre_usuario, correo, contrasena) VALUES ('$nombre_usuario', '$correo', '$contrasena')";

        if ($conn->query($sql) === TRUE) {
            // Registro exitoso, redirigir con éxito
            header('Location: ./login.html?success=1');
            exit();
        } else {
            echo "Error: " . $sql . "<br>" . $conn->error;
        }
    }
}
$conn->close();
?>
