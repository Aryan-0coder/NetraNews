$body = '{"content":"This is a test article about economy growth and elections.","language":"en"}'
try {
  Write-Output "EN summary:"
  $res = Invoke-RestMethod -Uri 'http://localhost:8080/api/ai/summarize' -Method Post -Body $body -ContentType 'application/json'
  $res | ConvertTo-Json | Write-Output
} catch { Write-Output "EN summary error: $_" }

$body = '{"content":"देश में आज महत्वपूर्ण घटनाएँ और बारिश का मौसम।","language":"hi"}'
try {
  Write-Output "HI summary:"
  $res = Invoke-RestMethod -Uri 'http://localhost:8080/api/ai/summarize' -Method Post -Body $body -ContentType 'application/json'
  $res | ConvertTo-Json | Write-Output
} catch { Write-Output "HI summary error: $_" }

$body = '{"message":"Tell me about latest sports news","language":"en"}'
try {
  Write-Output "EN chat:"
  $res = Invoke-RestMethod -Uri 'http://localhost:8080/api/ai/chat' -Method Post -Body $body -ContentType 'application/json'
  $res | ConvertTo-Json | Write-Output
} catch { Write-Output "EN chat error: $_" }

$body = '{"message":"नवीनतम खेल की खबर बताओ","language":"hi"}'
try {
  Write-Output "HI chat:"
  $res = Invoke-RestMethod -Uri 'http://localhost:8080/api/ai/chat' -Method Post -Body $body -ContentType 'application/json'
  $res | ConvertTo-Json | Write-Output
} catch { Write-Output "HI chat error: $_" }
