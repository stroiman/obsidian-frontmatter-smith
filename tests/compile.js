require("esbuild-runner").install({
	type: "transform", //toalso  preserve debug points, else it bundles everything.
	// debug: true,
	esbuild: {
		//TODO can extend esbuild here with the same config as used by the actual build process
	},
});
