import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@RocketShoes:cart');

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      const { data: { amount: amountInStock } } = await api.get<Stock>(`/stock/${productId}`);

      console.log('quantidade', amountInStock);

      const { data: newProduct } = await api.get<Product>(`/products/${productId}`);

      if (amountInStock === 0) {
        toast.error('Quantidade solicitada fora de estoque');
        return;
      }

      setCart(prevState => {
        const productAlreadyExists = prevState.find(product => product.id === productId);
  
        if (productAlreadyExists) {
          const newCart = prevState.map(product => product.id === productId ? { ...product, amount: product.amount + 1 } : product);
          localStorage.setItem('@RocketShoes:cart', JSON.stringify(newCart));

          return newCart;
        } else {
          const newCart = [...prevState, { ...newProduct, amount: 1 }];
          localStorage.setItem('@RocketShoes:cart', JSON.stringify(newCart));

          return newCart;
        }
      });
    } catch {
      toast.error('Erro na adição do produto');
    }
  };

  const removeProduct = (productId: number) => {
    try {

      if (cart.find(product => product.id === productId)) {
        setCart(prevState => {
          const newCart = prevState.filter(product => product.id !== productId);
          localStorage.setItem('@RocketShoes:cart', JSON.stringify(newCart));
  
          return newCart;
        })
      } else {
        throw new Error(); 
      }

    } catch {
      toast.error('Erro na remoção do produto'); 
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {

      if (amount <= 0) {
        return;
      }

      const { data: { amount: amountInStock } } = await api.get<Stock>(`/stock/${productId}`)

      if (amount > amountInStock) {
        toast.error('Quantidade solicitada fora de estoque');
      } else {
        setCart(prevState => {
          const newCart = prevState.map(product => product.id === productId ? { ...product, amount } : product);
          localStorage.setItem('@RocketShoes:cart', JSON.stringify(newCart));
          return newCart;
        });
      }

    } catch {
      toast.error('Erro na alteração de quantidade do produto');
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
