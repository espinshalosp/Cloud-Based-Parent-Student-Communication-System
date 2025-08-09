<?php
require_once __DIR__ . '/db.php';
require_role('teacher');
header('Content-Type: application/json');

$studentId = isset($_POST['student_id']) ? (int)$_POST['student_id'] : 0;
$subject = trim($_POST['subject'] ?? '');
$marks = isset($_POST['marks']) ? (int)$_POST['marks'] : -1;

if ($studentId <= 0 || $subject === '' || $marks < 0 || $marks > 100) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid input']);
    exit;
}

try {
    $stmt = $pdo->prepare('INSERT INTO marks (student_id, subject, marks) VALUES (?, ?, ?)');
    $stmt->execute([$studentId, $subject, $marks]);
    echo json_encode(['success' => true]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to save marks']);
}