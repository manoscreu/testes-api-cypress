import { faker } from '@faker-js/faker';

describe('Testes de criação de usuário', function () {
  beforeEach(() => {
    cy.visit('./app/index.html');
  });

  it('Deve verificar se existe um link para a lista de usuários', function () {
    cy.contains('a[href="./usuarios.html"]', 'Todos os usuários').should(
      'be.visible'
    );
  });

  it('Deve verificar se existe um link para a página de sobre', function () {
    cy.contains('a[href="./sobre.html"]', 'Sobre').should('be.visible');
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
    it('Deve ocorrer um erro quando o e-mail já estiver em uso', function () {
      const novoUsuario = {
        name: 'Nome usuário',
        email: 'i@t.com.br',
      };

      cy.request({
        method: 'POST',
        url: Cypress.env('apiBaseUrl') + '/users',
        body: novoUsuario,
        failOnStatusCode: false,
      });

      cy.intercept('POST', 'api/v1/users').as('postUsuario');
      cy.stub().as('stubAlerta');

      cy.on('window:alert', this.stubAlerta);

      cy.get('#name').type(novoUsuario.name);
      cy.get('#email').type(novoUsuario.email);
      cy.contains('button', 'Cadastrar').click();

      cy.wait('@postUsuario').then(() => {
        expect(this.stubAlerta).to.be.calledOnce;
        expect(this.stubAlerta).to.be.calledOnceWith('User already exists.');
      });
      cy.get('#lista-usuarios').should('be.empty');
    });

    it('Ao criar um usuário, o e-mail deve ser exibido na lista', function () {
      const name = faker.person.fullName();
      const email = faker.internet.email();

      cy.intercept('POST', 'api/v1/users').as('postUser');

      cy.get('#name').type(name);
      cy.get('#email').type(email);
      cy.contains('button', 'Cadastrar').click();

      cy.wait('@postUser');
      cy.contains('#lista-usuarios', email);

      cy.intercept('POST', 'api/v1/users', {
        statusCode: 201,
        body: {
          id: '41fffdfa-0cc1-4fcd-8aba-0de1fa7db7be',
          name: ' Novo usuario',
          email: 'novo@email.com',
          updatedAt: '2024-04-25T23:36:32.111Z',
          createdAt: '2024-04-25T23:36:32.111Z',
        },
      }).as('postUser');

      cy.contains('button', 'Cadastrar').click();

      cy.wait('@postUser');
      cy.contains('#lista-usuarios', 'novo@email.com');
    });

    it('Deve ocorrer um erro quando o e-mail já estiver em uso com intercept', function () {
      cy.intercept('POST', 'api/v1/users', {
        statusCode: 422,
        body: {
          error: 'User already exists.',
        },
      }).as('postUsuario');
      cy.stub().as('stubAlerta');

      cy.on('window:alert', this.stubAlerta);

      cy.get('#name').type('Nome usuário');
      cy.get('#email').type('admin1234@teste.com');
      cy.contains('button', 'Cadastrar').click();

      cy.wait('@postUsuario').then(() => {
        cy.wait(2000);
        // expect(this.stubAlerta).to.be.calledOnce;
        // expect(this.stubAlerta).to.be.calledOnceWith('User already exists.');
      });
      cy.get('#lista-usuarios').should('be.empty');
    });
  });
});
