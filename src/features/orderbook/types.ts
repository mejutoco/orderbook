export type BidAsk = {
    price: number,
    count: number,
    amount: number,
}
export type BidAsks = BidAsk[]

export type Book = {
    bids: {
        [key: number]: {
            count: number,
            amount: number,
        }
    },
    asks: {
        [key: number]: {
            count: number,
            amount: number,
        }
    },
}
