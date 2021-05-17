import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { MdShoppingBasket } from 'react-icons/md';

import logo from '../../assets/images/logo.svg';
import { Container, Cart } from './styles';
import { useCart } from '../../hooks/useCart';
import { Product } from '../../types';

const Header = (): JSX.Element => {
  const { cart } = useCart();
  
  const cartSize = useMemo(() => {
    const distincItems: Product[] = [];

    cart.forEach(cartItem => {
      const alreadyExists = distincItems.find(item => item.id === cartItem.id);

      if (!alreadyExists) {
        distincItems.push(cartItem);
      }
    });

    return distincItems.length;
  }, [cart]);

  return (
    <Container>
      <Link to="/">
        <img src={logo} alt="Rocketshoes" />
      </Link>

      <Cart to="/cart">
        <div>
          <strong>Meu carrinho</strong>
          <span data-testid="cart-size">
            {cartSize === 1 ? `${cartSize} item` : `${cartSize} itens`}
          </span>
        </div>
        <MdShoppingBasket size={36} color="#FFF" />
      </Cart>
    </Container>
  );
};

export default Header;
