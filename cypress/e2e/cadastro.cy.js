describe('Testes de criação de usuário', function () {
  beforeEach(() => {
    cy.visit('./app/index.html');
  });

  describe('Testes de formulário', function () {
    it('Não deve ser possível cadastrar o usuário sem informar um nome', function () {
      cy.intercept('POST', '/api/v1/users').as('postUsuario');

      cy.get('#email').type('teste@teste.com');
      cy.contains('button', 'Cadastrar').click();

      cy.wait('@postUsuario');
      cy.get('#lista-usuarios').should('be.empty');
    });

    it('Não deve ser possível cadastrar o usuário sem informar um e-mail', function () {
      cy.intercept('POST', '/api/v1/users').as('postUsuario');
      cy.intercept('GET', '/api/v1/users').as('consultaUsuarios');

      cy.get('#name').type('Usuário teste');
      cy.contains('button', 'Cadastrar').click();

      // apenas exemplo
      cy.wait('@postUsuario').then((resultado) => {
        cy.log(resultado);
        expect(resultado.response.statusCode).to.equal(400);
      });
      // fim exemplo
      cy.get('#lista-usuarios').should('be.empty');

      cy.contains('Todos os usuários').click();
      cy.wait('@consultaUsuarios');
      cy.get('#content-usuarios').should('not.contain', 'Usuário teste');
    });

    it('O formato de e-mail deve ser válido', function () {
      cy.get('#name').type('Nome usuário');
      cy.get('#email').type('emailinvalido');
      cy.contains('button', 'Cadastrar').click();

      cy.get('#lista-usuarios').should('be.empty');
    });

    it('Deve ser possível limpar os campos do formulário', function () {
      cy.get('#name').type('Nome usuário');
      cy.get('#email').type('example@teste.com');

      cy.get('[data-test-id="clearButton"]').click();

      cy.get('#name').invoke('val').should('be.empty');
      cy.get('#email').invoke('val').should('be.empty');
    });
  });

  describe('Cadastro de usuário', function () {
    const novoUsuario = {
      name: 'Nome usuário',
      email: 'i@t.com.br',
    };

    before(() => {
      cy.request({
        method: 'POST',
        url: Cypress.env('apiBaseUrl') + '/users',
        body: novoUsuario,
        failOnStatusCode: false,
      });
    });

    it.only('Deve ocorrer um erro quando o e-mail já estiver em uso', function () {
      cy.intercept('POST', 'api/v1/users').as('postUsuario');
      cy.on('window:alert', (mensagemAlerta) => {
        expect(mensagemAlerta).to.equal('User already exists.');
      });

      cy.get('#name').type(novoUsuario.name);
      cy.get('#email').type(novoUsuario.email);
      cy.contains('button', 'Cadastrar').click();

      cy.wait('@postUsuario');
      cy.get('#lista-usuarios').should('be.empty');
    });

    it('Ao criar um usuário, o e-mail deve ser exibido na lista', function () {});
  });
});
