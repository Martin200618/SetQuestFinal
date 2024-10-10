<?php
class RegistroUsuario {
    private $conn;

    // Constructor para inicializar la conexión a la base de datos
    public function __construct($servername, $username, $password, $dbname) {
        try {
            $this->conn = new PDO("mysql:host=$servername;dbname=$dbname", $username, $password);
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch (PDOException $e) {
            echo "Error de conexión: " . $e->getMessage();
            exit();
        }
    }

    // Método para registrar un nuevo usuario
    public function registrar($nombre_usuario, $correo, $contrasena) {
        // Validar datos del formulario
        if (empty($nombre_usuario) || empty($correo) || empty($contrasena)) {
            header('Location: registro.php?error=campos_vacios');
            exit();
        }

        // Validar formato del correo
        if (!filter_var($correo, FILTER_VALIDATE_EMAIL)) {
            header('Location: registro.php?error=correo_invalido');
            exit();
        }

        // Consultar si el correo o el nombre de usuario ya existen
        $sql = "SELECT * FROM usuario WHERE correo = :correo OR nombre_usuario = :nombre_usuario";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute(['correo' => $correo, 'nombre_usuario' => $nombre_usuario]);

        if ($stmt->rowCount() > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($row['correo'] == $correo) {
                header('Location: registro.php?error=correo');
                exit();
            }
            if ($row['nombre_usuario'] == $nombre_usuario) {
                header('Location: registro.php?error=nombre_usuario');
                exit();
            }
        } else {
            // Hashear la contraseña
            $hash_contrasena = password_hash($contrasena, PASSWORD_BCRYPT);

            // Insertar el nuevo usuario
            $sql = "INSERT INTO usuario (nombre_usuario, correo, contrasena) VALUES (:nombre_usuario, :correo, :contrasena)";
            $stmt = $this->conn->prepare($sql);

            if ($stmt->execute(['nombre_usuario' => $nombre_usuario, 'correo' => $correo, 'contrasena' => $hash_contrasena])) {
                // Registro exitoso, redirigir con éxito
                header('Location: ./login.html?success=1');
                exit();
            } else {
                echo "Error al registrar el usuario.";
            }
        }
    }

    // Destructor para cerrar la conexión
    public function __destruct() {
        $this->conn = null;
    }
}

// Comprobar si la solicitud es POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $nombre_usuario = trim($_POST['nombre_usuario'] ?? '');
    $correo = trim($_POST['correo'] ?? '');
    $contrasena = $_POST['contrasena'] ?? '';

    // Crear una instancia de la clase RegistroUsuario
    $registroUsuario = new RegistroUsuario('localhost', 'root', '', 'setquest');
    $registroUsuario->registrar($nombre_usuario, $correo, $contrasena);
}
?>