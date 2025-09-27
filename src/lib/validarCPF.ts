export function validarCPF(cpf: string): boolean {
  cpf = cpf.replace(/\D/g, '');
  if (cpf.length !== 11 || /^([0-9])\1+$/.test(cpf)) return false;
  let soma = 0, resto;
  for (let i=1; i<=9; i++) soma += parseInt(cpf.substring(i-1,i))*(11-i);
  resto = (soma*10)%11;
  if (resto===10||resto===11) resto=0;
  if (resto !== parseInt(cpf.substring(9,10))) return false;
  soma=0;
  for (let i=1; i<=10; i++) soma += parseInt(cpf.substring(i-1,i))*(12-i);
  resto=(soma*10)%11;
  if (resto===10||resto===11) resto=0;
  if (resto !== parseInt(cpf.substring(10,11))) return false;
  return true;
}
