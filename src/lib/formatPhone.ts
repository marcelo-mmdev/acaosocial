export function formatPhone(v?: string | null) {
  if (!v) return '-'
  const digits = v.replace(/\D/g,'')
  if (digits.length === 11) return '('+digits.slice(0,2)+') '+digits.slice(2,7)+'-'+digits.slice(7)
  if (digits.length === 10) return '('+digits.slice(0,2)+') '+digits.slice(2,6)+'-'+digits.slice(6)
  return v
}
