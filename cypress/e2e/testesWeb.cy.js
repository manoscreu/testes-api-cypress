describe('template spec', () => {
  it('Deve visitar o site institucional', () => {
    cy.visit('./app/index.html');
    cy.url().should('equal', 'https://rarolabs.com.br/');
  });

  it('Deve visitar o site institucional com dimensões de tela customizáveis', () => {
    cy.viewport(550, 750);
    cy.visit('');
    cy.url().should('equal', 'https://rarolabs.com.br/');
  });

  it('Deve abrir a página de sobre', function () {
    cy.visit('/sobre');
    cy.url().should('equal', 'https://rarolabs.com.br/sobre');
  });

  it('Deve abrir a página de sobre de um iphone 8', function () {
    cy.viewport('iphone-8');
    cy.visit('/sobre');
    cy.url().should('equal', 'https://rarolabs.com.br/sobre');
  });

  it('Deve localizar o link de sobre', function () {
    cy.on('uncaught:exception', () => {
      return false;
    });

    cy.viewport('macbook-16');
    cy.visit('');
    cy.get('header.grid2 div h1');
    cy.contains('Grandes desafios');

    cy.get("[href='/sobre']").eq(1).click();
    cy.url().should('equal', 'https://rarolabs.com.br/sobre');
  });

  it('Deve preencher o formulário de contato', function () {
    cy.visit('');
    cy.contains('a', 'Contato').click();

    cy.wait(2000);
    cy.get('input[placeholder="testeste"]').type('seu nome');
  });
});
