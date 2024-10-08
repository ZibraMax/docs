const cos = Math.cos;
const sin = Math.sin;
const acos = Math.acos;
const sqrt = Math.sqrt;
const abs = Math.abs;

class mars {
	constructor() {}

	static coordinates(args) {
		let a = args["a"];
		let b = args["b"];
		let beta = (args["beta"] * Math.PI) / 180;
		let gamma1 = (args["gamma1"] * Math.PI) / 180;
		let gamma2 = (args["gamma2"] * Math.PI) / 180;
		let S = sqrt(
			(-(a ** 4) * sin(beta) ** 2 * sin(gamma1) ** 2 * sin(gamma2) ** 2) /
				(a ** 2 * sin(gamma1) ** 2 -
					2 * a ** 2 * sin(gamma1) * sin(gamma2) * cos(beta) +
					a ** 2 * sin(gamma2) ** 2) +
				a ** 2 *
					cos(
						acos(
							sin(gamma1) * sin(gamma2) * cos(beta) -
								cos(gamma1) * cos(gamma2)
						) / 2
					) **
						2
		);
		let W =
			b *
			sin(
				acos(
					(sin(gamma1) ** 2 -
						sin(gamma1) * sin(gamma2) * cos(beta) +
						sin(gamma2) ** 2 -
						cos(gamma1) * cos(gamma2) -
						1) /
						(sin(gamma1) * sin(gamma2) * cos(beta) -
							cos(gamma1) * cos(gamma2) -
							1)
				) / 2
			);
		let H =
			(a ** 2 * sin(beta) * sin(gamma1) * sin(gamma2)) /
			sqrt(
				a ** 2 * sin(gamma1) ** 2 -
					2 * a ** 2 * sin(gamma1) * sin(gamma2) * cos(beta) +
					a ** 2 * sin(gamma2) ** 2
			);
		let V =
			b *
			cos(
				acos(
					(sin(gamma1) ** 2 -
						sin(gamma1) * sin(gamma2) * cos(beta) +
						sin(gamma2) ** 2 -
						cos(gamma1) * cos(gamma2) -
						1) /
						(sin(gamma1) * sin(gamma2) * cos(beta) -
							cos(gamma1) * cos(gamma2) -
							1)
				) / 2
			);
		let L =
			a *
			sin(
				acos(
					sin(gamma1) * sin(gamma2) * cos(beta) -
						cos(gamma1) * cos(gamma2)
				) / 2
			);
		W = 2 * W;
		L = 2 * L;
		let O0 = [0, 0, 0];
		let O1 = [0, 0, 0];
		let O2 = [0, 0, 0];
		O1[0] += W / 2;
		O1[1] += V;
		O2[0] += W;
		let O3 = [0, 0, 0];
		let O4 = [0, 0, 0];
		let O5 = [0, 0, 0];
		O3[0] += S;
		O3[1] += L / 2;
		O3[2] += H;
		O4[0] += S + W / 2;
		O4[1] += V + L / 2;
		O4[2] += H;
		O5[0] += W + S;
		O5[1] += L / 2;
		O5[2] += H;
		let O6 = [0, 0, 0];
		let O7 = [...O1];
		let O8 = [...O2];
		O6[1] += L;
		O7[1] += L;
		O8[1] += L;

		return [O0, O1, O2, O3, O4, O5, O6, O7, O8];
	}
	static poissonhw(args) {
		let a = args["a"];
		let b = args["b"];
		let beta = (args["beta"] * Math.PI) / 180;
		let gamma1 = (args["gamma1"] * Math.PI) / 180;
		let gamma2 = (args["gamma2"] * Math.PI) / 180;
		let value =
			(a ** 2 *
				((sin(beta) * sin(gamma1) * sin(gamma2)) /
					(sin(gamma1) * sin(gamma2) * cos(beta) -
						cos(gamma1) * cos(gamma2) -
						1) +
					((sin(gamma1) ** 2 -
						sin(gamma1) * sin(gamma2) * cos(beta) +
						sin(gamma2) ** 2 -
						cos(gamma1) * cos(gamma2) -
						1) *
						sin(beta) *
						sin(gamma1) *
						sin(gamma2)) /
						(sin(gamma1) * sin(gamma2) * cos(beta) -
							cos(gamma1) * cos(gamma2) -
							1) **
							2) *
				sin(beta) *
				sin(gamma1) *
				sin(gamma2) *
				cos(
					acos(
						(sin(gamma1) ** 2 -
							sin(gamma1) * sin(gamma2) * cos(beta) +
							sin(gamma2) ** 2 -
							cos(gamma1) * cos(gamma2) -
							1) /
							(sin(gamma1) * sin(gamma2) * cos(beta) -
								cos(gamma1) * cos(gamma2) -
								1)
					) / 2
				)) /
			(2 *
				sqrt(
					1 -
						(sin(gamma1) ** 2 -
							sin(gamma1) * sin(gamma2) * cos(beta) +
							sin(gamma2) ** 2 -
							cos(gamma1) * cos(gamma2) -
							1) **
							2 /
							(sin(gamma1) * sin(gamma2) * cos(beta) -
								cos(gamma1) * cos(gamma2) -
								1) **
								2
				) *
				((-(a ** 4) *
					sin(beta) ** 2 *
					sin(gamma1) ** 2 *
					sin(gamma2) ** 2) /
					(a ** 2 * sin(gamma1) ** 2 -
						2 * a ** 2 * sin(gamma1) * sin(gamma2) * cos(beta) +
						a ** 2 * sin(gamma2) ** 2) **
						(3 / 2) +
					(a ** 2 * sin(gamma1) * sin(gamma2) * cos(beta)) /
						sqrt(
							a ** 2 * sin(gamma1) ** 2 -
								2 *
									a ** 2 *
									sin(gamma1) *
									sin(gamma2) *
									cos(beta) +
								a ** 2 * sin(gamma2) ** 2
						)) *
				sqrt(
					a ** 2 * sin(gamma1) ** 2 -
						2 * a ** 2 * sin(gamma1) * sin(gamma2) * cos(beta) +
						a ** 2 * sin(gamma2) ** 2
				) *
				sin(
					acos(
						(sin(gamma1) ** 2 -
							sin(gamma1) * sin(gamma2) * cos(beta) +
							sin(gamma2) ** 2 -
							cos(gamma1) * cos(gamma2) -
							1) /
							(sin(gamma1) * sin(gamma2) * cos(beta) -
								cos(gamma1) * cos(gamma2) -
								1)
					) / 2
				));

		return value;
	}
	static poissonhl(args) {
		let a = args["a"];
		let b = args["b"];
		let beta = (args["beta"] * Math.PI) / 180;
		let gamma1 = (args["gamma1"] * Math.PI) / 180;
		let gamma2 = (args["gamma2"] * Math.PI) / 180;
		let value =
			(-(a ** 2) *
				sin(beta) ** 2 *
				sin(gamma1) ** 2 *
				sin(gamma2) ** 2 *
				cos(
					acos(
						sin(gamma1) * sin(gamma2) * cos(beta) -
							cos(gamma1) * cos(gamma2)
					) / 2
				)) /
			(2 *
				sqrt(
					1 -
						(sin(gamma1) * sin(gamma2) * cos(beta) -
							cos(gamma1) * cos(gamma2)) **
							2
				) *
				((-(a ** 4) *
					sin(beta) ** 2 *
					sin(gamma1) ** 2 *
					sin(gamma2) ** 2) /
					(a ** 2 * sin(gamma1) ** 2 -
						2 * a ** 2 * sin(gamma1) * sin(gamma2) * cos(beta) +
						a ** 2 * sin(gamma2) ** 2) **
						(3 / 2) +
					(a ** 2 * sin(gamma1) * sin(gamma2) * cos(beta)) /
						sqrt(
							a ** 2 * sin(gamma1) ** 2 -
								2 *
									a ** 2 *
									sin(gamma1) *
									sin(gamma2) *
									cos(beta) +
								a ** 2 * sin(gamma2) ** 2
						)) *
				sqrt(
					a ** 2 * sin(gamma1) ** 2 -
						2 * a ** 2 * sin(gamma1) * sin(gamma2) * cos(beta) +
						a ** 2 * sin(gamma2) ** 2
				) *
				sin(
					acos(
						sin(gamma1) * sin(gamma2) * cos(beta) -
							cos(gamma1) * cos(gamma2)
					) / 2
				));

		return value;
	}
	static poissonwl(args) {
		let a = args["a"];
		let b = args["b"];
		let beta = (args["beta"] * Math.PI) / 180;
		let gamma1 = (args["gamma1"] * Math.PI) / 180;
		let gamma2 = (args["gamma2"] * Math.PI) / 180;
		let value =
			(sqrt(
				1 -
					(sin(gamma1) ** 2 -
						sin(gamma1) * sin(gamma2) * cos(beta) +
						sin(gamma2) ** 2 -
						cos(gamma1) * cos(gamma2) -
						1) **
						2 /
						(sin(gamma1) * sin(gamma2) * cos(beta) -
							cos(gamma1) * cos(gamma2) -
							1) **
							2
			) *
				sin(beta) *
				sin(gamma1) *
				sin(gamma2) *
				sin(
					acos(
						(sin(gamma1) ** 2 -
							sin(gamma1) * sin(gamma2) * cos(beta) +
							sin(gamma2) ** 2 -
							cos(gamma1) * cos(gamma2) -
							1) /
							(sin(gamma1) * sin(gamma2) * cos(beta) -
								cos(gamma1) * cos(gamma2) -
								1)
					) / 2
				) *
				cos(
					acos(
						sin(gamma1) * sin(gamma2) * cos(beta) -
							cos(gamma1) * cos(gamma2)
					) / 2
				)) /
			(sqrt(
				1 -
					(sin(gamma1) * sin(gamma2) * cos(beta) -
						cos(gamma1) * cos(gamma2)) **
						2
			) *
				((sin(beta) * sin(gamma1) * sin(gamma2)) /
					(sin(gamma1) * sin(gamma2) * cos(beta) -
						cos(gamma1) * cos(gamma2) -
						1) +
					((sin(gamma1) ** 2 -
						sin(gamma1) * sin(gamma2) * cos(beta) +
						sin(gamma2) ** 2 -
						cos(gamma1) * cos(gamma2) -
						1) *
						sin(beta) *
						sin(gamma1) *
						sin(gamma2)) /
						(sin(gamma1) * sin(gamma2) * cos(beta) -
							cos(gamma1) * cos(gamma2) -
							1) **
							2) *
				sin(
					acos(
						sin(gamma1) * sin(gamma2) * cos(beta) -
							cos(gamma1) * cos(gamma2)
					) / 2
				) *
				cos(
					acos(
						(sin(gamma1) ** 2 -
							sin(gamma1) * sin(gamma2) * cos(beta) +
							sin(gamma2) ** 2 -
							cos(gamma1) * cos(gamma2) -
							1) /
							(sin(gamma1) * sin(gamma2) * cos(beta) -
								cos(gamma1) * cos(gamma2) -
								1)
					) / 2
				));

		return value;
	}
	static stiffnessx(args) {
		let a = args["a"];
		let b = args["b"];
		let beta_0 = (args["beta"] * Math.PI) / 180;
		let gamma1 = (args["gamma1"] * Math.PI) / 180;
		let gamma2 = (args["gamma2"] * Math.PI) / 180;
		let k = 1;

		let value =
			(2 *
				k *
				sqrt(
					(sin(gamma1) ** 2 -
						2 * sin(gamma1) * sin(gamma2) * cos(beta_0) +
						sin(gamma2) ** 2) /
						(-sin(gamma1) * sin(gamma2) * cos(beta_0) +
							cos(gamma1) * cos(gamma2) +
							1) **
							2
				) *
				(a *
					(cos(gamma1) + cos(gamma2)) ** 2 *
					(-(sin(gamma1) ** 2) -
						sin(gamma2) ** 2 +
						2 * cos(gamma1) * cos(gamma2) +
						2) *
					sin(beta_0) ** 2 +
					b *
						sqrt(
							(cos(gamma1 - gamma2) * cos(gamma1 + gamma2) +
								cos(gamma1 - gamma2) +
								cos(gamma1 + gamma2) +
								1) /
								(-sin(gamma1) * sin(gamma2) * cos(beta_0) +
									cos(gamma1) * cos(gamma2) +
									1) **
									2
						) *
						sqrt(
							((cos(gamma1 - gamma2) * cos(gamma1 + gamma2) +
								cos(gamma1 - gamma2) +
								cos(gamma1 + gamma2) +
								1) *
								sin(beta_0) ** 2) /
								(-sin(gamma1) * sin(gamma2) * cos(beta_0) +
									cos(gamma1) * cos(gamma2) +
									1) **
									2
						) *
						(-sin(gamma1) * sin(gamma2) * cos(beta_0) +
							cos(gamma1) * cos(gamma2) +
							1) **
							4 *
						abs(sin(beta_0))) *
				abs((cos(gamma1) + cos(gamma2)) / sin(beta_0))) /
			(b *
				sqrt(
					(cos(gamma1 - gamma2) * cos(gamma1 + gamma2) +
						cos(gamma1 - gamma2) +
						cos(gamma1 + gamma2) +
						1) /
						(-sin(gamma1) * sin(gamma2) * cos(beta_0) +
							cos(gamma1) * cos(gamma2) +
							1) **
							2
				) *
				sqrt(
					((cos(gamma1 - gamma2) * cos(gamma1 + gamma2) +
						cos(gamma1 - gamma2) +
						cos(gamma1 + gamma2) +
						1) *
						sin(beta_0) ** 2) /
						(-sin(gamma1) * sin(gamma2) * cos(beta_0) +
							cos(gamma1) * cos(gamma2) +
							1) **
							2
				) *
				(cos(gamma1) + cos(gamma2)) ** 2 *
				(-sin(gamma1) * sin(gamma2) * cos(beta_0) +
					cos(gamma1) * cos(gamma2) +
					1) **
					2 *
				sin(gamma1) *
				sin(gamma2) *
				sin(beta_0) *
				cos(
					acos(
						(sin(gamma1) * sin(gamma2) * cos(beta_0) +
							cos(gamma1) ** 2 +
							cos(gamma1) * cos(gamma2) +
							cos(gamma2) ** 2 -
							1) /
							(-sin(gamma1) * sin(gamma2) * cos(beta_0) +
								cos(gamma1) * cos(gamma2) +
								1)
					) / 2
				));
		return value;
	}
	static stiffnessky(args) {
		let a = args["a"];
		let b = args["b"];
		let beta_0 = (args["beta"] * Math.PI) / 180;
		let gamma1 = (args["gamma1"] * Math.PI) / 180;
		let gamma2 = (args["gamma2"] * Math.PI) / 180;
		let k = 1;

		let value =
			(2 *
				k *
				sqrt(
					1 -
						(sin(gamma1) * sin(gamma2) * cos(beta_0) -
							cos(gamma1) * cos(gamma2)) **
							2
				) *
				(a *
					(cos(gamma1) + cos(gamma2)) ** 2 *
					(-(sin(gamma1) ** 2) -
						sin(gamma2) ** 2 +
						2 * cos(gamma1) * cos(gamma2) +
						2) *
					sin(beta_0) ** 2 +
					b *
						sqrt(
							(cos(gamma1 - gamma2) * cos(gamma1 + gamma2) +
								cos(gamma1 - gamma2) +
								cos(gamma1 + gamma2) +
								1) /
								(-sin(gamma1) * sin(gamma2) * cos(beta_0) +
									cos(gamma1) * cos(gamma2) +
									1) **
									2
						) *
						sqrt(
							((cos(gamma1 - gamma2) * cos(gamma1 + gamma2) +
								cos(gamma1 - gamma2) +
								cos(gamma1 + gamma2) +
								1) *
								sin(beta_0) ** 2) /
								(-sin(gamma1) * sin(gamma2) * cos(beta_0) +
									cos(gamma1) * cos(gamma2) +
									1) **
									2
						) *
						(-sin(gamma1) * sin(gamma2) * cos(beta_0) +
							cos(gamma1) * cos(gamma2) +
							1) **
							4 *
						abs(sin(beta_0)))) /
			(a *
				sqrt(
					(cos(gamma1 - gamma2) * cos(gamma1 + gamma2) +
						cos(gamma1 - gamma2) +
						cos(gamma1 + gamma2) +
						1) /
						(-sin(gamma1) * sin(gamma2) * cos(beta_0) +
							cos(gamma1) * cos(gamma2) +
							1) **
							2
				) *
				sqrt(
					((cos(gamma1 - gamma2) * cos(gamma1 + gamma2) +
						cos(gamma1 - gamma2) +
						cos(gamma1 + gamma2) +
						1) *
						sin(beta_0) ** 2) /
						(-sin(gamma1) * sin(gamma2) * cos(beta_0) +
							cos(gamma1) * cos(gamma2) +
							1) **
							2
				) *
				(-sin(gamma1) * sin(gamma2) * cos(beta_0) +
					cos(gamma1) * cos(gamma2) +
					1) **
					4 *
				sin(gamma1) *
				sin(gamma2) *
				sin(beta_0) *
				cos(
					acos(
						sin(gamma1) * sin(gamma2) * cos(beta_0) -
							cos(gamma1) * cos(gamma2)
					) / 2
				) *
				abs(sin(beta_0)));
		return value;
	}
}

export { mars };
