//Response type
export interface ApiResponse {
	status: 'FAILED' | 'SUCCESS'
	error: string | null
	message: string | null
}

/** The wire envelope every endpoint returns — the payload lives under `data`. */
export interface ApiEnvelope<T> extends ApiResponse {
	data: T
}
