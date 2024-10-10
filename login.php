<?php
session_start(); 
// Inicia una sesión PHP.

class Usuario {
    private $conn;

    // Constructor para inicializar la conexión a la base de datos
    public function __construct($servername, $username, $password, $dbname) {
        try {
            $this->conn = new PDO("mysql:host=$servername;dbname=$dbname", $username, $password);
            // Configurar PDO para que lance excepciones en caso de errores
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch (PDOException $e) {
            echo "Error de conexión: " . $e->getMessage();
            exit();
        }
    }

    // Método para iniciar sesión
    public function iniciarSesion($correo, $contrasena) {
        // Consulta preparada para seleccionar usuario con el correo proporcionado
        $sql = "SELECT * FROM usuario WHERE correo = :correo";
        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(':correo', $correo, PDO::PARAM_STR);
        $stmt->execute();

        if ($stmt->rowCount() > 0) {
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            // Verificar la contraseña
            if (password_verify($contrasena, $user['contrasena'])) {
                // Guardar el nombre completo en la sesión
                $_SESSION['usuario'] = $user['nombre_completo'];
                // Redirigir al usuario
                header('Location: ./seleccion-modos.html');
                exit();
            } else {
                return "Contraseña incorrecta.";
            }
        } else {
            return "Correo no registrado.";
        }
    }

    // Destructor para cerrar la conexión
    public function __destruct() {
        $this->conn = null;
    }
}

// Verificar si se ha enviado un formulario con el método POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $correo = $_POST['correo'] ?? '';
    $contrasena = $_POST['contrasena'] ?? '';

    // Crear una instancia de la clase Usuario
    $usuario = new Usuario('localhost', 'root', '', 'setquest');
    $mensajeError = $usuario->iniciarSesion($correo, $contrasena);

    // Mostrar mensaje de error si existe
    if ($mensajeError) {
        echo $mensajeError;
    }
}
?>
