const conversationPattern = /^\/c\/([^\/?#]+)(?=\/|$)/

export const getChatgptConversationId = (
  loc: Location = window.location
): string | undefined => {
  const m = conversationPattern.exec(loc.pathname)
  return m ? decodeURIComponent(m[1]) : undefined
}
