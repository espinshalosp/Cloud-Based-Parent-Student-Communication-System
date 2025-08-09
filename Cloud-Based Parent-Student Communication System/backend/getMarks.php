<?php
require_once __DIR__ . '/db.php';
require_login();
header('Content-Type: application/json');

$role = $_SESSION['role'] ?? '';
$studentId = null;

if ($role === 'parent') {
    $studentId = $_SESSION['child_id'] ?? null;
} else {
    $studentId = isset($_GET['student_id']) ? (int)$_GET['student_id'] : null;
}

if (!$studentId) {
    // For teachers, allow fetching all if not provided
    if ($role === 'teacher') {
        $stmt = $pdo->query('SELECT subject, marks, student_id FROM marks ORDER BY id DESC');
        echo json_encode($stmt->fetchAll());
        exit;
    }
    http_response_code(400);
    echo json_encode(['error' => 'Student ID is required']);
    exit;
}

$stmt = $pdo->prepare('SELECT subject, marks FROM marks WHERE student_id = ? ORDER BY id DESC');
$stmt->execute([$studentId]);
echo json_encode($stmt->fetchAll());