const CHAVE_DEVICE_ID = 'dominus_device_id'

// Identificador único e persistente deste tablet (gerado uma vez, salvo no localStorage).
export function getDeviceId() {
  let id = localStorage.getItem(CHAVE_DEVICE_ID)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(CHAVE_DEVICE_ID, id)
  }
  return id
}
