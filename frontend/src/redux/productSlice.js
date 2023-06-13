import { createSlice } from "@reduxjs/toolkit";
import {toast} from 'react-hot-toast';

const initialState={
    productList : [],
    cartItem : []
}

export const productSlice=createSlice({
    name: 'product',
    initialState,
    reducers:{
        setDataProduct : (state,action) =>{
            //console.log(action)
            state.productList=[...action.payload]
        },
        addCartItem : (state,action)=>{
           const check =state.cartItem.some(e => e._id === action.payload._id)
           if(check){
            toast("Lready in cart")
           }else{
            const total=action.payload.price
            toast("Product added in cart")
            state.cartItem=[...state.cartItem,{...action.payload,qty : 1,total : total}]
           }
            
        },
        deleteCartItem : (state,action)=>{
            toast("One item deleted")
            const index =state.cartItem.findIndex(e=>e._id===action.payload)
            state.cartItem.splice(index,1)

        },
        increaseQty : (state,action)=>{
            const index =state.cartItem.findIndex(e=>e._id===action.payload)
            let qty=state.cartItem[index].qty
            const qtyInc=++qty
            state.cartItem[index].qty=qtyInc

            const price=state.cartItem[index].price
            const total = price *qtyInc
            state.cartItem[index].total=total


        },
        decreaseQty : (state,action)=>{
            const index =state.cartItem.findIndex(e=>e._id===action.payload)
            let qty=state.cartItem[index].qty
            if(qty>1){
                const qtyDec=--qty
                state.cartItem[index].qty=qtyDec
    
                const price=state.cartItem[index].price
                const total = price *qtyDec
                state.cartItem[index].total=total
            }

            
        }

    }
})
export const {setDataProduct,addCartItem,deleteCartItem,increaseQty,decreaseQty} = productSlice.actions
export default productSlice.reducer