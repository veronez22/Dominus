import { X } from 'lucide-react'
import './ModalTermos.css'

function ModalTermos({ onFechar }) {
  return (
    <div className="modal-overlay termos-overlay" onClick={onFechar}>
      <div className="termos-modal" onClick={(e) => e.stopPropagation()}>

        <div className="termos-header">
          <h2>Termos de Uso</h2>
          <button className="termos-fechar" onClick={onFechar}>
            <X size={18} />
          </button>
        </div>

        <div className="termos-conteudo">
          <section className="termos-secao">
            <h3>1. Sobre o sistema</h3>
            <p>Este sistema de cardápio digital é disponibilizado pela Aguirra Esfiharia para facilitar a realização de pedidos. Ao utilizar este sistema, você concorda com os termos aqui descritos.</p>
          </section>

          <section className="termos-secao">
            <h3>2. Uso do sistema</h3>
            <p>O sistema é destinado exclusivamente para realização de pedidos dentro do estabelecimento. É proibido o uso indevido, tentativa de fraude ou qualquer ação que prejudique o funcionamento do sistema ou de outros clientes.</p>
          </section>

          <section className="termos-secao">
            <h3>3. Pedidos e pagamentos</h3>
            <p>Ao confirmar um pedido, você se compromete a efetuar o pagamento pelo valor total apresentado. O estabelecimento aceita PIX, cartão de débito/crédito e dinheiro. Pedidos confirmados não podem ser cancelados sem a assistência de um garçom.</p>
          </section>

          <section className="termos-secao">
            <h3>4. Privacidade</h3>
            <p>Não coletamos dados pessoais dos clientes através deste sistema. As informações de pedido são utilizadas exclusivamente para a preparação e entrega dos produtos solicitados, sendo descartadas ao final da sessão.</p>
          </section>

          <section className="termos-secao">
            <h3>5. Disponibilidade dos produtos</h3>
            <p>Os produtos exibidos estão sujeitos à disponibilidade no momento do pedido. Em caso de indisponibilidade, um garçom entrará em contato para oferecer alternativas ou cancelar o item.</p>
          </section>

          <section className="termos-secao">
            <h3>6. Imagens e preços</h3>
            <p>As imagens dos produtos são meramente ilustrativas. Os preços exibidos são válidos no momento do pedido e podem sofrer alterações sem aviso prévio. O valor cobrado será o exibido no momento da confirmação do pedido.</p>
          </section>

          <section className="termos-secao">
            <h3>7. Contato</h3>
            <p>Em caso de dúvidas, problemas com o sistema ou com o pedido, solicite assistência a um de nossos garçons ou entre em contato pelo WhatsApp: (16) 9 9372-2231.</p>
          </section>
        </div>

        <button className="termos-btn-fechar" onClick={onFechar}>
          Entendi
        </button>

      </div>
    </div>
  )
}

export default ModalTermos