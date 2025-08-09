<?php
require_once __DIR__ . '/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: ../frontend/login.html');
    exit;
}

$email = trim($_POST['email'] ?? '');
$password = $_POST['password'] ?? '';

if ($email === '' || $password === '') {
    header('Location: ../frontend/login.html?error=1');
    exit;
}

$stmt = $pdo->prepare('SELECT id, name, email, password, role, child_id FROM users WHERE email = ? LIMIT 1');
$stmt->execute([$email]);
$user = $stmt->fetch();

if (!$user || !password_verify($password, $user['password'])) {
    header('Location: ../frontend/login.html?error=1');
    exit;
}

$_SESSION['user_id'] = (int)$user['id'];
$_SESSION['name'] = $user['name'];
$_SESSION['role'] = $user['role'];
$_SESSION['child_id'] = $user['child_id'] ? (int)$user['child_id'] : null;

if ($user['role'] === 'teacher') {
    header('Location: ../frontend/teacher-dashboard.html');
} else {
    header('Location: ../frontend/parent-dashboard.html');
}
exit;
