async function testPatch() {
  const res = await fetch('http://localhost:3000/api/admin/orders', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer saivashisht@123'
    },
    body: JSON.stringify({ orderId: 'ff738b56-df3e-45a4-bf5d-fc23986b24f8', newStatus: 'shipped' })
  });

  console.log(res.status);
  console.log(await res.text());
}

testPatch();
