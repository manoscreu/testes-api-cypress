describe('Cadastro de usuário', function () {
  it('Verificar preenchimento dos elementos da tela', function () {
    cy.visit('./app/index.html');
    cy.get('#name').type('Maria');

    cy.get('#name')
      .invoke('val')
      .should('equal', 'Maria')
      .and('not.equal', 'João');

    cy.get('[href="./sobre.html"]').invoke('text').should('equal', 'Sobre');
  });

  it('Verificar se o alerta é exibido', function () {
    cy.on('uncaught:exception', () => {
      return false;
    });

    cy.on('window:alert', (mensagemAlerta) => {
      expect(mensagemAlerta).to.equal('User alredy exists.');
      return null;
    });

    const stub = cy.stub();
    cy.on('window:alert', stub);

    cy.visit('./app/index.html');

    cy.get('#name').type('Iury');
    cy.get('#email').type('i@t.com');

    cy.contains('Cadastrar').click();
  });

  it('Deve interceptar a consulta de usuários', function () {
    cy.intercept({
      method: 'GET',
      url: '/api/v1/users',
    }).as('buscarUsuarios');

    cy.visit('./app/index.html');
    cy.contains('Todos os usuários').click();
    cy.wait('@buscarUsuarios').then((data) => cy.log(data));

    cy.contains('Santiago96@yahoo.com').should('be.visible');
  });
});
