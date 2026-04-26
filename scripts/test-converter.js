const budgetId = "cmoedksv80001gp21qlacuo7o";
async function test() {
  const res = await fetch("http://localhost:3001/api/orcamentos/converter", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ budgetId }),
  });
  const data = await res.json();
  console.log("Status:", res.status);
  console.log("Data:", data);
}
test();
