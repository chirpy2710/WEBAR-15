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

      // Tap to place
      session.addEventListener('select', () => {

        if (!reticle.getAttribute('visible')) return;

        const pos = reticle.object3D.position;

        model.object3D.position.set(
          pos.x,
          pos.y,
          pos.z
        );

        model.object3D.visible = true;
      });

      // Create hit-test source
      this.viewerSpace = await session.requestReferenceSpace('viewer');
      this.xrHitTestSource = await session.requestHitTestSource({
        space: this.viewerSpace
      });

      this.refSpace = await session.requestReferenceSpace('local');
    });

    sceneEl.renderer.xr.addEventListener('sessionend', () => {
      this.xrHitTestSource = null;
      this.viewerSpace = null;
      this.refSpace = null;
    });
  },

  tick: function () {

    const sceneEl = this.el.sceneEl;

    if (!sceneEl.is('ar-mode')) return;
    if (!this.xrHitTestSource || !this.refSpace) return;

    const frame = sceneEl.frame;
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
