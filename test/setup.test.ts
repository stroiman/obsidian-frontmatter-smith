import * as sinon from "sinon";
import * as chai from "chai";
import sinonChai from "sinon-chai";

chai.should();
chai.use(sinonChai);

declare module "sinon" {
	// eslint-disable-next-line
	interface SinonStub<TArgs, TReturnValue> {
		selectsOption: (x: string) => void;
	}
}

sinon.addBehavior("selectsOption", function (fake, value) {
	fake.callsFake((items: { text: string }[]) => {
		const item = items.find((x) => x.text === value);
		if (!item) {
			throw new Error("Issue in test, item not selectable");
		}
		return Promise.resolve(item);
	});
});

afterEach(() => {
	sinon.reset();
});
