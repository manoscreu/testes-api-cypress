import { faker } from '@faker-js/faker';
import CadastroPage from '../support/pages/cadastro.page';
import ListaUsuarioPage from '../support/pages/listaUsuarios.page';

describe('Testes de criação de usuário', function () {
  var paginaCadastro = new CadastroPage();
  var paginaListaUsuario = new ListaUsuarioPage();
  beforeEach(() => {
    cy.visit('./app/index.html');
  });

  it('Deve verificar se existe um link para a lista de usuários', function () {
    cy.contains(paginaCadastro.linkPaginaUsuarios, 'Todos os usuários').should(
      'be.visible'
    );
  });

  it('Deve verificar se existe um link para a página de sobre', function () {
    cy.contains(paginaCadastro.linkPaginaSobre, 'Sobre').should('be.visible');
  });

  describe('Testes de formulário', function () {
    it('Não deve ser possível cadastrar o usuário sem informar um nome', function () {
      cy.intercept('POST', '/api/v1/users').as('postUsuario');

      paginaCadastro.typeEmail('teste@teste.com');
      paginaCadastro.clickButtonCadastrar();

      cy.wait('@postUsuario');
      paginaCadastro.getListaUsuarios().should('be.empty');
    });

    it('Não deve ser possível cadastrar o usuário sem informar um e-mail', function () {
      cy.intercept('POST', '/api/v1/users').as('postUsuario');
      cy.intercept('GET', '/api/v1/users').as('consultaUsuarios');

      paginaCadastro.typeNome('Usuário teste');
      paginaCadastro.clickButtonCadastrar();

      // apenas exemplo
      cy.wait('@postUsuario').then((resultado) => {
        cy.log(resultado);
        expect(resultado.response.statusCode).to.equal(400);
      });
      // fim exemplo
      paginaCadastro.getListaUsuarios().should('be.empty');

      cy.get(paginaCadastro.linkPaginaUsuarios).click();
      cy.wait('@consultaUsuarios');
      cy.get(paginaListaUsuario.listaUsuarios).should(
        'not.contain',
        'Usuário teste'
      );
    });

    it('O formato de e-mail deve ser válido', function () {
      paginaCadastro.cadastrar('Nome usuário', 'emailinvalido');
      paginaCadastro.getListaUsuarios().should('be.empty');
    });

    it('Deve ser possível limpar os campos do formulário', function () {
      paginaCadastro.typeNome('Nome usuário');
      paginaCadastro.typeEmail('example@teste.com');
      paginaCadastro.clickButtonLimpar();

      cy.get(paginaCadastro.inputNome).invoke('val').should('be.empty');
      cy.get(paginaCadastro.inputEmail).invoke('val').should('be.empty');
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

      paginaCadastro.cadastrar(novoUsuario.name, novoUsuario.email);

      cy.wait('@postUsuario').then(() => {
        cy.wait(1000);
        expect(this.stubAlerta).to.be.calledOnce;
        expect(this.stubAlerta).to.be.calledOnceWith('User already exists.');
      });
      paginaCadastro.getListaUsuarios().should('be.empty');
    });

    it('Ao criar um usuário, o e-mail deve ser exibido na lista', function () {
      const name = faker.person.fullName();
      const email = faker.internet.email();

      cy.intercept('POST', 'api/v1/users').as('postUser');

      paginaCadastro.cadastrar(name, email);

      cy.wait('@postUser');
      cy.contains(paginaCadastro.listaUsuarios, email);

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

      paginaCadastro.clickButtonCadastrar();

      cy.wait('@postUser');
      cy.contains(paginaCadastro.listaUsuarios, 'novo@email.com');
    });

    it('Deve ocorrer um erro quando o e-mail já estiver em uso com intercept', function () {
      cy.intercept('POST', 'api/v1/users', {
        statusCode: 422,
        fixture: '/mocks/mockErrorUserAlreadyExists.json',
      }).as('postUsuario');
      cy.stub().as('stubAlerta');

      cy.on('window:alert', this.stubAlerta);

      paginaCadastro.cadastrar('Nome usuário', 'admin1234@teste.com');

      cy.wait('@postUsuario');
      paginaCadastro.getListaUsuarios().should('be.empty');
    });
  });
});
