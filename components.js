AFRAME.registerComponent('ar-reticle', {

  init: function () {

    this.xrHitTestSource = null;
    this.viewerSpace = null;
    this.refSpace = null;

    const sceneEl = this.el.sceneEl;
    const reticle = this.el;
    const model = document.getElementById('box');

    sceneEl.renderer.xr.addEventListener('sessionstart', async () => {

      const session = sceneEl.renderer.xr.getSession();

      // Viewer space
      this.viewerSpace = await session.requestReferenceSpace('viewer');

      // Hit test source
      this.xrHitTestSource = await session.requestHitTestSource({
        space: this.viewerSpace
      });

      // Local reference space
      this.refSpace = await session.requestReferenceSpace('local');

      console.log("AR Started");

      // Place model on tap
      session.addEventListener('select', () => {

        if (!reticle.getAttribute('visible')) return;

        const position = reticle.object3D.position;

        model.object3D.position.copy(position);
        model.setAttribute('visible', true);

        console.log("Model placed");
      });

    });

    sceneEl.renderer.xr.addEventListener('sessionend', () => {

      this.xrHitTestSource = null;
      this.viewerSpace = null;
      this.refSpace = null;

      console.log("AR Ended");
    });
  },

  tick: function () {

    const sceneEl = this.el.sceneEl;

    if (!sceneEl.is('ar-mode')) return;
    if (!this.xrHitTestSource || !this.refSpace) return;

    const frame = sceneEl.frame;
    if (!frame) return;

    const hitTestResults = frame.getHitTestResults(this.xrHitTestSource);

    if (hitTestResults.length > 0) {

      const pose = hitTestResults[0].getPose(this.refSpace);

      const matrix = new THREE.Matrix4();
      matrix.fromArray(pose.transform.matrix);

      const position = new THREE.Vector3();
      position.setFromMatrixPosition(matrix);

      this.el.object3D.position.copy(position);
      this.el.setAttribute('visible', true);

    } else {

      this.el.setAttribute('visible', false);
    }
  }
});
