import Resolver from 'ember-resolver';
import {
  setResolver
} from 'ember-qunit';

const resolver = Resolver.create();

setResolver(resolver);
