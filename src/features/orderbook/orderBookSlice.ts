import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit';
import {RootState, AppThunk} from '../../app/store';
import {Book, BidAsks} from './types';

const initialState = {
    bids: [{price: 0, count: 0, amount: 0}],
    asks: [{price: 0, count: 0, amount: 0}],
}

export const orderBookSlice = createSlice({
    name: 'orderbook',
    initialState,
    reducers: {
        // Use the PayloadAction type to declare the contents of `action.payload`
        updateBids: (state, action: PayloadAction<any>) => {
            state.bids = action.payload;
        },
        updateAsks: (state, action: PayloadAction<any>) => {
            state.asks = action.payload;
        },
        reset: (state) => {
            state.asks = [];
            state.bids = [];
        },
    },
    extraReducers: (builder) => {
    },
});

export const {updateBids, updateAsks, reset} = orderBookSlice.actions;

export const selectBids = (state: RootState) => state.orderBook.bids;
export const selectAsks = (state: RootState) => state.orderBook.asks;


export default orderBookSlice.reducer;
