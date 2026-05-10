async function testChat() {
  const response = await fetch('http://localhost:3001/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [{ role: 'user', content: 'Hello Debo' }]
    })
  });
  
  console.log('Chat Status:', response.status);
  const text = await response.text();
  console.log('Chat Response Snippet:', text.slice(0, 500));
}

testChat().catch(console.error);
