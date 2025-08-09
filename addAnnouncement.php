<?php
require_once __DIR__ . '/db.php';
require_role('teacher');
header('Content-Type: application/json');

$title = trim($_POST['title'] ?? '');
$message = trim($_POST['message'] ?? '');
$date = date('Y-m-d');

if ($title === '' || $message === '') {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid input']);
    exit;
}

try {
    $stmt = $pdo->prepare('INSERT INTO announcements (title, message, date) VALUES (?, ?, ?)');
    $stmt->execute([$title, $message, $date]);
    echo json_encode(['success' => true]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to publish announcement']);
}