<?php
require_once __DIR__ . '/db.php';
require_login();
header('Content-Type: application/json');

$stmt = $pdo->query('SELECT date, title, message FROM announcements ORDER BY date DESC, id DESC');
echo json_encode($stmt->fetchAll());