<?php
session_start();

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
        $correo = $_POST['correo'];
        $contraseña = $_POST['contraseña'];

        // Preparar la consulta para evitar inyecciones SQL
        $stmt = $pdo->prepare("SELECT * FROM users WHERE correo = :correo");
        $stmt->bindParam(':correo', $correo);
        $stmt->execute();

        // Verificar si el correo existe
        if ($stmt->rowCount() > 0) {
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Verificar la contraseña
            if (password_verify($contraseña, $user['contraseña'])) {
                $_SESSION['usuario'] = $user['nombre_completo'];
                echo "Inicio de sesión exitoso.";
                header('Location: ./seleccion-modos.html');  // Redirigir a la página principal
                exit(); // Asegurarse de detener la ejecución después de la redirección
            } else {
                echo "Contraseña incorrecta.";
            }
        } else {
            echo "Correo no registrado.";
        }
    }
} catch (PDOException $e) {
    echo "Error al conectar a la base de datos: " . $e->getMessage();
}

// Cerrar la conexión (no estrictamente necesario, ya que PDO lo hace automáticamente al finalizar el script)
$pdo = null;
?>