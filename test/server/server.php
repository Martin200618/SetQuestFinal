<?php
use Ratchet\MessageComponentInterface;
use Ratchet\ConnectionInterface;
use Ratchet\Server\IoServer;
use Ratchet\Http\HttpServer;
use Ratchet\WebSocket\WsServer;

    require dirname(__DIR__) . '/server/vendor/autoload.php';

class Chat implements MessageComponentInterface {

    protected $clients;

    public function __construct()
    {
        $this->clients=new SplObjectStorage();
    }

    public function onOpen(ConnectionInterface $conn) 
    {
        $this->clients->attach($conn);
        $conn->id = $this->clients->count();

        echo "New connection $conn->id\n";
    }

    public function onMessage(ConnectionInterface $from, $msg) {
        $data = json_decode($msg, true);

        foreach ($this->clients as $clients) {
            $clients->send(json_encode
            (['id'=>$from->id, 
            'mensaje'=>$data['mensaje']]));
        }
    }

    public function onClose(ConnectionInterface $conn) {
        echo "connection closed\n";
    }

    public function onError(ConnectionInterface $conn, \Exception $e) {
        echo "error";
    }
}
    $server = IoServer::factory(
        new HttpServer(
            new WsServer(
                new Chat()
            )
        ),
        8080
    );

    $server->run();