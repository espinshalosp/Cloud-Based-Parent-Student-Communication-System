<?php
require_once __DIR__ . '/db.php';
require_role('teacher');
header('Content-Type: application/json');

$studentId = isset($_POST['student_id']) ? (int)$_POST['student_id'] : 0;
$date = trim($_POST['date'] ?? '');
$status = strtolower(trim($_POST['status'] ?? ''));

if ($studentId <= 0 || $date === '' || !in_array($status, ['present', 'absent'], true)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid input']);
    exit;
}

try {
    $stmt = $pdo->prepare('INSERT INTO attendance (student_id, date, status) VALUES (?, ?, ?)');
    $stmt->execute([$studentId, $date, $status]);
    echo json_encode(['success' => true]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to save attendance']);
}