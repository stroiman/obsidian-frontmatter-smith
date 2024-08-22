import { GlobalRegistrator } from "@happy-dom/global-registrator";

before(() => {
  GlobalRegistrator.register();
});

after(() => {
  GlobalRegistrator.unregister();
});
