<?php
header('Content-Type: application/json');

try {
    $host = "localhost";
    $db = "shirtify";
    $user = "neo_shirtify";
    $pass = 'Unix321';

    $pdo = new PDO(
        "mysql:host=$host,dbname=$db;charset=utf8"
        ,$user
        ,$pass);

    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::EXCEPTION);

    $sql = "SELECT * FROM users";
    $stmt = $pdf->prepare($sql);
    $stmt->execute();

    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($data);

} catch (PDOException $e) {
    echo json_encode([
        "error" => $e->getMessage()
    ]);
}


?>