async function testPatch() {
  const res = await fetch('http://localhost:3000/api/admin/orders', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer saivashisht@123'
    },
    body: JSON.stringify({ orderId: '0df2c566-6dda-44cd-a147-d5f308752a7f', newStatus: 'shipped' })
  });

  console.log(res.status);
  console.log(await res.text());
}

testPatch();
