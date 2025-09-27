export function validarCPF(cpf:string){
  if(!cpf) return false
  const s = cpf.replace(/\D/g,'')
  if (s.length !== 11) return false
  if (/^(\d)\1+$/.test(s)) return false
  const nums = s.split('').map(Number)
  let sum = 0
  for (let i=0;i<9;i++) sum += nums[i]*(10-i)
  let rev = 11 - (sum % 11)
  if (rev === 10 || rev === 11) rev = 0
  if (rev !== nums[9]) return false
  sum = 0
  for (let i=0;i<10;i++) sum += nums[i]*(11-i)
  rev = 11 - (sum % 11)
  if (rev === 10 || rev === 11) rev = 0
  return rev === nums[10]
}
