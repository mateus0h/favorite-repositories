import React, { Component } from 'react';
import { FaGithub, FaPlus, FaSpinner } from 'react-icons/fa';
import { Link } from 'react-router-dom';

import api from '../../services/api';

import Container from '../../components/Container';
import { Form, SubmitButton, List } from './styles';

export default class Main extends Component {
  state = {
    newRepo: '',
    repositories: [],
    loading: false,
    repoNotFound: false,
  };

  // Carregar os dados do localStorage
  componentDidMount() {
    const repositories = localStorage.getItem('repositories');

    if (repositories) {
      this.setState({ repositories: JSON.parse(repositories) });
    }
  }

  // Salvar os dados do localStorage

  componentDidUpdate(_, prevState) {
    const { repositories } = this.state;

    if (prevState.repositories !== repositories) {
      localStorage.setItem('repositories', JSON.stringify(repositories));
    }
  }

  handleInputChange = e => {
    this.setState({ newRepo: e.target.value });
  };

  handleSubmit = async e => {
    e.preventDefault();

    this.setState({ loading: true });

    const { newRepo, repositories } = this.state;

    const repoExists = repositories.find(element => {
      return element.name === newRepo;
    });

    if (repoExists) {
      throw new Error('Repositório duplicado');
    }

    const response = await api.get(`/repos/${newRepo}`).catch(() => {
      // Repository not found
      return '404';
    });

    if (response === '404') {
      this.setState({ loading: false });
      this.setState({ repoNotFound: true }); // coloca borda no input

      return false;
    }

    const data = {
      name: response.data.full_name,
    };

    return this.setState({
      repositories: [...repositories, data],
      newRepo: '',
      loading: false,
      repoNotFound: false,
    });
  };

  render() {
    const { newRepo, loading, repositories, repoNotFound } = this.state;

    return (
      <Container>
        <h1>
          <FaGithub />
          <div>Repositórios</div>
        </h1>
        <Form onSubmit={this.handleSubmit} repoNotFound={repoNotFound ? 1 : 0}>
          <input
            type="text"
            placeholder="Adicionar repositório"
            value={newRepo}
            onChange={this.handleInputChange}
          />

          <SubmitButton loading={loading ? 1 : 0}>
            {loading ? (
              <FaSpinner color="#fff" size={14} />
            ) : (
              <FaPlus color="#FFF" size={14} />
            )}
          </SubmitButton>
        </Form>

        <List>
          {repositories.map(repository => (
            <li key={repository.name}>
              <span>{repository.name}</span>
              <Link to={`/repository/${encodeURIComponent(repository.name)}`}>
                Detalhes
              </Link>
            </li>
          ))}
        </List>
      </Container>
    );
  }
}
