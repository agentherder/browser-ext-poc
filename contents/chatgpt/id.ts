const conversationPattern = /^\/c\/([^\/?#]+)(?=\/|$)/

export const getChatgptConversationId = (
  loc: Location = window.location
): string | null => {
  const m = conversationPattern.exec(loc.pathname)
  return m ? decodeURIComponent(m[1]) : null
}
