function DialoguePanel({ npc, onClose }) {
  return (
    <div className="dialogue-backdrop">
      <article className="dialogue-panel">
        <p className="npc-role">{npc.tone} channel</p>
        <h2>{npc.name}</h2>
        <p>{npc.profile}</p>
        <div className="npc-message">{npc.message}</div>
        <button onClick={onClose} type="button">
          Close transmission
        </button>
      </article>
    </div>
  )
}

export default DialoguePanel
