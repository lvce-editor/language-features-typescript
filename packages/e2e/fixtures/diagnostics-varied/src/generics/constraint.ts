type Numeric<T extends number> = T

export type Invalid = Numeric<string>
