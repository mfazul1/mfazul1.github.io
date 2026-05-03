<?php
error_reporting(0);
ini_set('display_errors', '0');
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

$to = 'fazulwork25@gmail.com';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Invalid request method.']);
    exit;
}

$name = isset($_POST['name']) ? trim($_POST['name']) : '';
$email = isset($_POST['email']) ? trim($_POST['email']) : '';
$subject = isset($_POST['subject']) ? trim($_POST['subject']) : 'New contact request';
$messageText = isset($_POST['message']) ? trim($_POST['message']) : '';

if ($name === '' || $email === '' || $messageText === '') {
    echo json_encode(['success' => false, 'message' => 'Please fill in all required fields.']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'message' => 'Please enter a valid email address.']);
    exit;
}

$headers = "MIME-Version: 1.0\r\n";
$headers .= "Content-type: text/html; charset=iso-8859-1\r\n";
$headers .= "From: feedback@jeeiitianbooks.in\r\n";
$headers .= "Reply-To: " . $email . "\r\n";

$emailSubject = 'Contact Form: ' . $subject;

$emailBody = '<html><body>';
$emailBody .= '<h2>New Contact Request</h2>';
$emailBody .= '<p><strong>Name:</strong> ' . htmlspecialchars($name, ENT_QUOTES, 'UTF-8') . '</p>';
$emailBody .= '<p><strong>Email:</strong> ' . htmlspecialchars($email, ENT_QUOTES, 'UTF-8') . '</p>';
$emailBody .= '<p><strong>Subject:</strong> ' . htmlspecialchars($subject, ENT_QUOTES, 'UTF-8') . '</p>';
$emailBody .= '<p><strong>Message:</strong><br>' . nl2br(htmlspecialchars($messageText, ENT_QUOTES, 'UTF-8')) . '</p>';
$emailBody .= '</body></html>';

if (mail($to, $emailSubject, $emailBody, $headers)) {
    echo json_encode(['success' => true, 'message' => 'Your message has been sent successfully.']);
} else {
    echo json_encode(['success' => false, 'message' => 'Mail delivery failed. Please try again later.']);
}

?>
