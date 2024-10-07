<?php
// Configuración de la base de datos
$servername = "localhost";
$username = "root";  // Cambia esto si tienes otro usuario
$password = "";  // Cambia esto si tienes contraseña
$dbname = "setquest";

try {
    // Crear una nueva conexión PDO
    $pdo = new PDO("mysql:host=$servername;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $nombre_completo = $_POST['nombre_completo'];
        $nick = $_POST['nick'];
        $correo = $_POST['correo'];
        $contraseña = password_hash($_POST['contraseña'], PASSWORD_BCRYPT);

        // Preparar la consulta para validar que no se repita el correo ni el nick
        $sql = "SELECT * FROM users WHERE correo = :correo OR nick = :nick";
        $stmt = $pdo->prepare($sql);
        $stmt->bindParam(':correo', $correo);
        $stmt->bindParam(':nick', $nick);
        $stmt->execute();

        if ($stmt->rowCount() > 0) {
            // Obtener la fila que coincide con el correo o el nick
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            // Verificar si el correo ya está registrado
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
            $sql = "INSERT INTO users (nombre_completo, nick, correo, contraseña) 
                    VALUES (:nombre_completo, :nick, :correo, :contraseña)";
            $stmt = $pdo->prepare($sql);
            $stmt->bindParam(':nombre_completo', $nombre_completo);
            $stmt->bindParam(':nick', $nick);
            $stmt->bindParam(':correo', $correo);
            $stmt->bindParam(':contraseña', $contraseña);

            if ($stmt->execute()) {
                // Registro exitoso, redirigir con éxito
                header('Location: ./login.html');
                exit();
            } else {
                echo "Error al registrar el usuario.";
            }
        }
    }
} catch (PDOException $e) {
    echo "Error en la conexión: " . $e->getMessage();
}

// Cerrar la conexión
$pdo = null;
?>