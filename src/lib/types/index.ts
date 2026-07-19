// The frontend's type contract with the backend — one barrel over the per-endpoint
// files. These mirror the shapes documented in docs/03-api-endpoints-and-ai.md; if a
// shape changes there, change it in the file below and it flows through here.

export * from './common'
export * from './players'
export * from './playerSearch'
export * from './playerDetails'
export * from './similarPlayers'
export * from './playerComparison'
