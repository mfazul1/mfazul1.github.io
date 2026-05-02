<?php
header('Content-Type: application/json');

$response = ['success' => false, 'message' => ''];

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $rating = isset($_POST['rating']) ? intval($_POST['rating']) : 0;
    $feedbackText = isset($_POST['feedback']) ? $_POST['feedback'] : '';
    $sessionId = isset($_POST['sessionId']) ? $_POST['sessionId'] : 'N/A';
    $date = isset($_POST['date']) ? $_POST['date'] : 'N/A';
    $time = isset($_POST['time']) ? $_POST['time'] : 'N/A';

    // Basic validation
    if ($rating < 1 || $rating > 5) {
        $response['message'] = 'Invalid rating provided.';
        echo json_encode($response);
        exit;
    }

    $to = 'fazulwork25@gmail.com';
    $subject = "Jeeiitianbooks.in_Feedback_{$sessionId}_{$date}_{$time}";

    $message = "
        <html>
        <head>
            <title>Jeeiitianbooks.in Feedback</title>
        </head>
        <body>
            <h2>New Feedback for Jeeiitianbooks.in Exam</h2>
            <p><strong>Rating:</strong> {$rating} stars</p>
            <p><strong>Session ID:</strong> {$sessionId}</p>
            <p><strong>Date:</strong> {$date}</p>
            <p><strong>Time:</strong> {$time}</p>
            <h3>Feedback Details:</h3>
            <p>" . nl2br(htmlspecialchars($feedbackText)) . "</p>
        </body>
        </html>
    ";

    $headers = "MIME-Version: 1.0\r\n";
    $headers .= "Content-type: text/html; charset=iso-8859-1\r\n";
    $headers .= "From: feedback@jeeiitianbooks.in\r\n"; // Sender email, can be a no-reply address

    // Attempt to send email
    if (@mail($to, $subject, $message, $headers)) {
        $response['success'] = true;
        $response['message'] = 'Feedback submitted successfully!';
    } else {
        $response['message'] = 'Failed to send feedback email.';
    }
} else {
    $response['message'] = 'Invalid request method.';
}

echo json_encode($response);
?>
